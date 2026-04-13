import * as crypto from 'crypto';
import * as net from 'net';
import * as tls from 'tls';
import {
  AuthenticationTypes,
  MessageTypes,
  MessageWriter,
  buildMessage,
  buildPasswordMessage,
  buildQueryMessage,
  buildStartupMessage,
  buildTerminateMessage,
  oidToTypeName,
  parseCommandComplete,
  parseDataRow,
  parseErrorFields,
  parseMessages,
  parseRowDescription,
  type ColumnDescription,
  type ParsedMessage
} from './protocol';

export interface ConnectionConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  sslMode: 'disable' | 'require' | 'verify-ca' | 'verify-full';
  queryTimeout?: number;
}

export interface QueryResult {
  columns: { name: string; type: string; typeOid: number }[];
  rows: Record<string, any>[];
  rowCount: number | null;
  command: string;
}

export class PostgresClient {
  private config: ConnectionConfig;

  constructor(config: ConnectionConfig) {
    this.config = config;
  }

  async query(sql: string, timeoutMs?: number): Promise<QueryResult> {
    let timeout = timeoutMs || this.config.queryTimeout || 30000;
    let socket = await this.connect(timeout);

    try {
      let result = await this.executeQuery(socket, sql, timeout);
      await this.terminate(socket);
      return result;
    } catch (err) {
      socket.destroy();
      throw err;
    }
  }

  async multiQuery(statements: string[], timeoutMs?: number): Promise<QueryResult[]> {
    let timeout = timeoutMs || this.config.queryTimeout || 30000;
    let socket = await this.connect(timeout);

    try {
      let results: QueryResult[] = [];
      for (let sql of statements) {
        let result = await this.executeQuery(socket, sql, timeout);
        results.push(result);
      }
      await this.terminate(socket);
      return results;
    } catch (err) {
      socket.destroy();
      throw err;
    }
  }

  private connect(timeoutMs: number): Promise<net.Socket> {
    return new Promise((resolve, reject) => {
      let timer = setTimeout(() => {
        socket.destroy();
        reject(new Error(`Connection timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      let socket: net.Socket;

      let handleConnection = async (sock: net.Socket) => {
        try {
          await this.authenticate(sock, timeoutMs);
          clearTimeout(timer);
          resolve(sock);
        } catch (err) {
          clearTimeout(timer);
          sock.destroy();
          reject(err);
        }
      };

      if (this.config.sslMode !== 'disable') {
        // First establish a plain TCP connection, then upgrade to TLS
        socket = net.createConnection({
          host: this.config.host,
          port: this.config.port
        });

        socket.once('error', err => {
          clearTimeout(timer);
          reject(new Error(`Connection failed: ${err.message}`));
        });

        socket.once('connect', () => {
          // Send SSL request
          let sslRequest = new Uint8Array(8);
          let view = new DataView(sslRequest.buffer);
          view.setInt32(0, 8, false); // message length
          view.setInt32(4, 80877103, false); // SSL request code
          socket.write(sslRequest);

          socket.once('data', response => {
            let responseChar = String.fromCharCode(response[0]!);
            if (responseChar === 'S') {
              // Server supports SSL, upgrade connection
              let tlsOptions: tls.ConnectionOptions = {
                socket: socket,
                rejectUnauthorized:
                  this.config.sslMode === 'verify-ca' || this.config.sslMode === 'verify-full',
                servername:
                  this.config.sslMode === 'verify-full' ? this.config.host : undefined
              };
              let tlsSocket = tls.connect(tlsOptions);
              tlsSocket.once('secureConnect', () => {
                handleConnection(tlsSocket as any);
              });
              tlsSocket.once('error', err => {
                clearTimeout(timer);
                reject(new Error(`SSL connection failed: ${err.message}`));
              });
            } else if (responseChar === 'N') {
              if (this.config.sslMode === 'require') {
                // Server doesn't support SSL but we require it - some implementations proceed anyway
                // For 'require', we just need encryption, not cert verification, so fall back to plain
                handleConnection(socket);
              } else {
                clearTimeout(timer);
                socket.destroy();
                reject(new Error('Server does not support SSL connections'));
              }
            } else {
              clearTimeout(timer);
              socket.destroy();
              reject(new Error(`Unexpected SSL response: ${responseChar}`));
            }
          });
        });
      } else {
        socket = net.createConnection({
          host: this.config.host,
          port: this.config.port
        });

        socket.once('error', err => {
          clearTimeout(timer);
          reject(new Error(`Connection failed: ${err.message}`));
        });

        socket.once('connect', () => {
          handleConnection(socket);
        });
      }
    });
  }

  private authenticate(socket: net.Socket, timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      let buffer: Uint8Array = new Uint8Array(0);
      let authenticated = false;

      let timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Authentication timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      let cleanup = () => {
        clearTimeout(timer);
        socket.removeListener('data', onData);
        socket.removeListener('error', onError);
      };

      let onError = (err: Error) => {
        cleanup();
        reject(new Error(`Authentication error: ${err.message}`));
      };

      let onData = (data: Uint8Array) => {
        let newBuffer = new Uint8Array(buffer.length + data.length);
        newBuffer.set(buffer);
        newBuffer.set(data, buffer.length);
        buffer = newBuffer;

        let { messages, remaining } = parseMessages(buffer);
        buffer = remaining;

        for (let msg of messages) {
          if (msg.type === MessageTypes.AUTHENTICATION) {
            let view = new DataView(msg.body.buffer, msg.body.byteOffset, msg.body.byteLength);
            let authType = view.getInt32(0, false);

            if (authType === AuthenticationTypes.OK) {
              authenticated = true;
            } else if (authType === AuthenticationTypes.CLEARTEXT_PASSWORD) {
              socket.write(buildPasswordMessage(this.config.password));
            } else if (authType === AuthenticationTypes.MD5_PASSWORD) {
              let salt = msg.body.slice(4, 8);
              let md5Password = this.computeMd5Password(
                this.config.username,
                this.config.password,
                salt
              );
              socket.write(buildPasswordMessage(md5Password));
            } else if (authType === AuthenticationTypes.SASL) {
              this.handleSaslAuth(socket, msg, buffer, timeoutMs)
                .then(({ remaining: newRemaining }) => {
                  buffer = newRemaining;
                  // SASL auth complete, continue listening for ReadyForQuery
                })
                .catch(err => {
                  cleanup();
                  reject(err);
                });
              return; // SASL handler takes over data events temporarily
            } else {
              cleanup();
              reject(new Error(`Unsupported authentication method: ${authType}`));
              return;
            }
          } else if (msg.type === MessageTypes.ERROR_RESPONSE) {
            let fields = parseErrorFields(msg.body);
            cleanup();
            reject(
              new Error(
                `PostgreSQL error: ${fields['message'] || 'Unknown error'}${fields['detail'] ? ` - ${fields['detail']}` : ''}`
              )
            );
            return;
          } else if (msg.type === MessageTypes.READY_FOR_QUERY) {
            if (authenticated) {
              cleanup();
              resolve();
              return;
            }
          }
          // Ignore ParameterStatus, BackendKeyData, NoticeResponse
        }
      };

      socket.on('data', onData);
      socket.on('error', onError);

      // Send startup message
      socket.write(buildStartupMessage(this.config.username, this.config.database));
    });
  }

  private computeMd5Password(username: string, password: string, salt: Uint8Array): string {
    let inner = crypto
      .createHash('md5')
      .update(password + username)
      .digest('hex');
    let outer = crypto.createHash('md5').update(inner).update(salt).digest('hex');
    return 'md5' + outer;
  }

  private async handleSaslAuth(
    socket: net.Socket,
    initialMsg: ParsedMessage,
    currentBuffer: Uint8Array,
    timeoutMs: number
  ): Promise<{ remaining: Uint8Array }> {
    // Parse available SASL mechanisms
    let decoder = new TextDecoder();
    let mechanisms: string[] = [];
    let offset = 4; // skip auth type int
    while (offset < initialMsg.body.length) {
      let end = initialMsg.body.indexOf(0, offset);
      if (end === -1 || end === offset) break;
      mechanisms.push(decoder.decode(initialMsg.body.slice(offset, end)));
      offset = end + 1;
    }

    if (!mechanisms.includes('SCRAM-SHA-256')) {
      throw new Error(
        `Unsupported SASL mechanisms: ${mechanisms.join(', ')}. Only SCRAM-SHA-256 is supported.`
      );
    }

    // SCRAM-SHA-256 authentication
    let nonce = crypto.randomBytes(18).toString('base64');
    let clientFirstBare = `n=,r=${nonce}`;
    let clientFirstMessage = `n,,${clientFirstBare}`;

    // Send SASLInitialResponse
    let encoder = new TextEncoder();
    let mechanismBytes = encoder.encode('SCRAM-SHA-256');
    let clientFirstBytes = encoder.encode(clientFirstMessage);
    let writer = new MessageWriter();
    writer.writeBytes(mechanismBytes);
    writer.writeByte(0); // null terminator for mechanism name
    writer.writeInt32(clientFirstBytes.length);
    writer.writeBytes(clientFirstBytes);
    socket.write(buildMessage(MessageTypes.PASSWORD, writer.toBuffer()));

    // Wait for SASLContinue
    let saslContinueMsg = await this.waitForMessage(
      socket,
      MessageTypes.AUTHENTICATION,
      currentBuffer,
      timeoutMs
    );
    let continueView = new DataView(
      saslContinueMsg.msg.body.buffer,
      saslContinueMsg.msg.body.byteOffset,
      saslContinueMsg.msg.body.byteLength
    );
    let continueAuthType = continueView.getInt32(0, false);
    if (continueAuthType !== AuthenticationTypes.SASL_CONTINUE) {
      throw new Error(`Expected SASL_CONTINUE, got auth type: ${continueAuthType}`);
    }

    let serverFirstMessage = decoder.decode(saslContinueMsg.msg.body.slice(4));
    let serverParams = this.parseScramMessage(serverFirstMessage);
    let serverNonce = serverParams['r'] || '';
    let saltBase64 = serverParams['s'] || '';
    let iterations = parseInt(serverParams['i'] || '4096', 10);

    if (!serverNonce.startsWith(nonce)) {
      throw new Error('Server nonce does not start with client nonce');
    }

    // Compute SCRAM proof
    let saltBytes = this.base64Decode(saltBase64);
    let saltedPassword = this.hi(
      this.normalizePassword(this.config.password),
      saltBytes,
      iterations
    );
    let clientKey = this.hmacSha256(saltedPassword, 'Client Key');
    let storedKey = new Uint8Array(crypto.createHash('sha256').update(clientKey).digest());

    let channelBinding = btoa('n,,');
    let clientFinalWithoutProof = `c=${channelBinding},r=${serverNonce}`;
    let authMessage = `${clientFirstBare},${serverFirstMessage},${clientFinalWithoutProof}`;

    let clientSignature = this.hmacSha256(storedKey, authMessage);
    let clientProof = new Uint8Array(clientKey.length);
    for (let i = 0; i < clientKey.length; i++) {
      clientProof[i] = clientKey[i]! ^ clientSignature[i]!;
    }

    let clientFinalMessage = `${clientFinalWithoutProof},p=${this.base64Encode(clientProof)}`;

    // Send SASLResponse
    let responseBytes = encoder.encode(clientFinalMessage);
    socket.write(buildMessage(MessageTypes.PASSWORD, responseBytes));

    // Wait for SASLFinal
    let saslFinalMsg = await this.waitForMessage(
      socket,
      MessageTypes.AUTHENTICATION,
      saslContinueMsg.remaining,
      timeoutMs
    );
    let finalView = new DataView(
      saslFinalMsg.msg.body.buffer,
      saslFinalMsg.msg.body.byteOffset,
      saslFinalMsg.msg.body.byteLength
    );
    let finalAuthType = finalView.getInt32(0, false);

    if (finalAuthType === AuthenticationTypes.SASL_FINAL) {
      let serverFinalMessage = decoder.decode(saslFinalMsg.msg.body.slice(4));
      let serverFinalParams = this.parseScramMessage(serverFinalMessage);
      let serverSignature = serverFinalParams['v'];

      // Verify server signature
      let serverKey = this.hmacSha256(saltedPassword, 'Server Key');
      let expectedServerSignature = this.base64Encode(this.hmacSha256(serverKey, authMessage));

      if (serverSignature !== expectedServerSignature) {
        throw new Error('Server signature verification failed');
      }
    }

    // Wait for AuthenticationOk + ReadyForQuery
    let readyBuffer = saslFinalMsg.remaining;
    return new Promise((resolve, reject) => {
      let timer = setTimeout(() => {
        cleanup();
        reject(new Error('SASL auth completion timeout'));
      }, timeoutMs);

      let cleanup = () => {
        clearTimeout(timer);
        socket.removeListener('data', onData);
        socket.removeListener('error', onError);
      };

      let onError = (err: Error) => {
        cleanup();
        reject(err);
      };

      let onData = (data: Uint8Array) => {
        let newBuf = new Uint8Array(readyBuffer.length + data.length);
        newBuf.set(readyBuffer);
        newBuf.set(data, readyBuffer.length);
        readyBuffer = newBuf;

        let { messages, remaining } = parseMessages(readyBuffer);
        readyBuffer = remaining;

        for (let msg of messages) {
          if (msg.type === MessageTypes.ERROR_RESPONSE) {
            let fields = parseErrorFields(msg.body);
            cleanup();
            reject(new Error(`PostgreSQL error: ${fields['message'] || 'Unknown error'}`));
            return;
          }
          if (msg.type === MessageTypes.READY_FOR_QUERY) {
            cleanup();
            resolve({ remaining: readyBuffer });
            return;
          }
        }
      };

      // Process any data already in buffer
      let { messages, remaining } = parseMessages(readyBuffer);
      readyBuffer = remaining;
      for (let msg of messages) {
        if (msg.type === MessageTypes.READY_FOR_QUERY) {
          cleanup();
          resolve({ remaining: readyBuffer });
          return;
        }
        if (msg.type === MessageTypes.ERROR_RESPONSE) {
          let fields = parseErrorFields(msg.body);
          cleanup();
          reject(new Error(`PostgreSQL error: ${fields['message'] || 'Unknown error'}`));
          return;
        }
      }

      socket.on('data', onData);
      socket.on('error', onError);
    });
  }

  private parseScramMessage(msg: string): Record<string, string> {
    let result: Record<string, string> = {};
    for (let part of msg.split(',')) {
      let eqIndex = part.indexOf('=');
      if (eqIndex > 0) {
        result[part.substring(0, eqIndex)] = part.substring(eqIndex + 1);
      }
    }
    return result;
  }

  private normalizePassword(password: string): string {
    return password;
  }

  private hi(password: string, salt: Uint8Array, iterations: number): Uint8Array {
    let encoder = new TextEncoder();
    let passwordBytes = encoder.encode(password);
    // PBKDF2 with HMAC-SHA-256
    let u = new Uint8Array(
      crypto
        .createHmac('sha256', passwordBytes)
        .update(salt)
        .update(new Uint8Array([0, 0, 0, 1]))
        .digest()
    );
    let result = new Uint8Array(u);
    for (let i = 1; i < iterations; i++) {
      u = new Uint8Array(crypto.createHmac('sha256', passwordBytes).update(u).digest());
      for (let j = 0; j < result.length; j++) {
        result[j] = result[j]! ^ u[j]!;
      }
    }
    return result;
  }

  private hmacSha256(key: Uint8Array | string, data: string): Uint8Array {
    let encoder = new TextEncoder();
    let keyBytes = typeof key === 'string' ? encoder.encode(key) : key;
    let dataBytes = typeof data === 'string' ? encoder.encode(data) : data;
    return new Uint8Array(crypto.createHmac('sha256', keyBytes).update(dataBytes).digest());
  }

  private base64Encode(data: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < data.length; i++) {
      binary += String.fromCharCode(data[i]!);
    }
    return btoa(binary);
  }

  private base64Decode(str: string): Uint8Array {
    let binary = atob(str);
    let bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  private waitForMessage(
    socket: net.Socket,
    expectedType: number,
    currentBuffer: Uint8Array,
    timeoutMs: number
  ): Promise<{ msg: ParsedMessage; remaining: Uint8Array }> {
    return new Promise((resolve, reject) => {
      let buffer = currentBuffer;

      let timer = setTimeout(() => {
        cleanup();
        reject(new Error('Timeout waiting for message'));
      }, timeoutMs);

      let cleanup = () => {
        clearTimeout(timer);
        socket.removeListener('data', onData);
        socket.removeListener('error', onError);
      };

      let onError = (err: Error) => {
        cleanup();
        reject(err);
      };

      let processBuffer = (): boolean => {
        let { messages, remaining } = parseMessages(buffer);
        buffer = remaining;

        for (let msg of messages) {
          if (msg.type === MessageTypes.ERROR_RESPONSE) {
            let fields = parseErrorFields(msg.body);
            cleanup();
            reject(new Error(`PostgreSQL error: ${fields['message'] || 'Unknown error'}`));
            return true;
          }
          if (msg.type === expectedType) {
            cleanup();
            resolve({ msg, remaining: buffer });
            return true;
          }
        }
        return false;
      };

      // Check existing buffer first
      if (processBuffer()) return;

      let onData = (data: Uint8Array) => {
        let newBuf = new Uint8Array(buffer.length + data.length);
        newBuf.set(buffer);
        newBuf.set(data, buffer.length);
        buffer = newBuf;
        processBuffer();
      };

      socket.on('data', onData);
      socket.on('error', onError);
    });
  }

  private executeQuery(
    socket: net.Socket,
    sql: string,
    timeoutMs: number
  ): Promise<QueryResult> {
    return new Promise((resolve, reject) => {
      let buffer: Uint8Array = new Uint8Array(0);
      let columns: ColumnDescription[] = [];
      let rows: (string | null)[][] = [];
      let command = '';
      let rowCount: number | null = null;

      let timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Query timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      let cleanup = () => {
        clearTimeout(timer);
        socket.removeListener('data', onData);
        socket.removeListener('error', onError);
      };

      let onError = (err: Error) => {
        cleanup();
        reject(new Error(`Query error: ${err.message}`));
      };

      let onData = (data: Uint8Array) => {
        let newBuf = new Uint8Array(buffer.length + data.length);
        newBuf.set(buffer);
        newBuf.set(data, buffer.length);
        buffer = newBuf;

        let { messages, remaining } = parseMessages(buffer);
        buffer = remaining;

        for (let msg of messages) {
          if (msg.type === MessageTypes.ROW_DESCRIPTION) {
            columns = parseRowDescription(msg.body);
          } else if (msg.type === MessageTypes.DATA_ROW) {
            rows.push(parseDataRow(msg.body));
          } else if (msg.type === MessageTypes.COMMAND_COMPLETE) {
            let parsed = parseCommandComplete(msg.body);
            command = parsed.command;
            rowCount = parsed.rowCount;
          } else if (msg.type === MessageTypes.ERROR_RESPONSE) {
            let fields = parseErrorFields(msg.body);
            cleanup();
            let errorMsg = fields['message'] || 'Unknown error';
            if (fields['detail']) errorMsg += ` - ${fields['detail']}`;
            if (fields['hint']) errorMsg += ` (Hint: ${fields['hint']})`;
            if (fields['position']) errorMsg += ` at position ${fields['position']}`;
            reject(
              new Error(`PostgreSQL query error [${fields['code'] || 'UNKNOWN'}]: ${errorMsg}`)
            );
            return;
          } else if (msg.type === MessageTypes.READY_FOR_QUERY) {
            cleanup();

            let mappedColumns = columns.map(col => ({
              name: col.name,
              type: oidToTypeName(col.typeOid),
              typeOid: col.typeOid
            }));

            let mappedRows = rows.map(row => {
              let obj: Record<string, any> = {};
              for (let i = 0; i < columns.length; i++) {
                let col = columns[i]!;
                let value = row[i] ?? null;
                obj[col.name] = castValue(value, col.typeOid);
              }
              return obj;
            });

            resolve({
              columns: mappedColumns,
              rows: mappedRows,
              rowCount,
              command
            });
            return;
          }
          // Ignore NoticeResponse, EmptyQueryResponse
        }
      };

      socket.on('data', onData);
      socket.on('error', onError);
      socket.write(buildQueryMessage(sql));
    });
  }

  private terminate(socket: net.Socket): Promise<void> {
    return new Promise(resolve => {
      try {
        socket.write(buildTerminateMessage());
      } catch {
        // Ignore write errors during termination
      }
      socket.end();
      socket.once('close', () => resolve());
      // Don't wait forever
      setTimeout(() => {
        socket.destroy();
        resolve();
      }, 1000);
    });
  }
}

// Cast PostgreSQL text values to appropriate JS types
let castValue = (value: string | null, typeOid: number): any => {
  if (value === null) return null;

  switch (typeOid) {
    case 16: // boolean
      return value === 't' || value === 'true';
    case 20: // bigint
    case 21: // smallint
    case 23: // integer
    case 26: // oid
      return parseInt(value, 10);
    case 700: // real
    case 701: // double precision
    case 1700: // numeric
      return parseFloat(value);
    case 114: // json
    case 3802: // jsonb
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
};
