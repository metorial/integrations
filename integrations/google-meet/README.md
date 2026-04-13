# <img src="https://provider-logos.metorial-cdn.com/google-meet.webp" height="20"> Google Meet

Create and manage Google Meet meeting spaces, configure access settings, moderation modes, and auto-artifacts like recordings and transcripts. Add, list, and remove space members with roles such as co-host. Retrieve conference records including participant details, join/leave times, and session history. Access meeting artifacts including recording metadata, transcript entries with speaker and timestamp data, and smart notes. Subscribe to real-time events for conference start/end, participant join/leave, and recording/transcript file generation via Google Workspace Events API.

## Tools

### Create Meeting Space

Create a new Google Meet meeting space with optional configuration. Returns the meeting URI and code that participants can use to join. Configure access controls, moderation, and auto-artifacts like recording and transcription.

### End Active Conference

End the currently active conference in a meeting space, disconnecting all participants. The meeting space itself remains available for future conferences.

### List Recordings

List recording resources from a conference record. Returns recording metadata including state, timestamps, and Google Drive file references. Recordings are saved as MP4 files in the organizer's Drive.

### Get Meeting Space

Retrieve details about a Google Meet meeting space by its resource name or meeting code. Returns the space configuration, meeting URI, and active conference information.

### List Transcripts

List transcripts from a conference record. Returns metadata including state, timestamps, and Google Docs references. Transcripts are saved as Google Docs in the organizer's Drive.

### List Conference Records

List conference records for past and ongoing meetings. Filter by space name, meeting code, or time range. Conference records contain start/end times and a reference to the meeting space.

### List Participants

List participants of a conference. Returns signed-in users, anonymous users, and phone users with their join/leave times. Available during and up to 30 days after a conference.

### Add Space Member

Add a member to a Google Meet space. Members can join the meeting without knocking. Optionally assign a role like COHOST to give them organizer-level control.

### Update Meeting Space

Update the configuration of an existing Google Meet meeting space. Modify access controls, moderation settings, feature restrictions, and auto-artifact settings. Only the fields you provide will be updated.

## License

This integration is licensed under the [AGPL-3.0 License](https://www.gnu.org/licenses/agpl-3.0.html).

<div align="center">
  <sub>Built with ❤️ by <a href="https://metorial.com">Metorial</a></sub>
</div>
