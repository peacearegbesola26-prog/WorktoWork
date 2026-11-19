# Marketplace repair results

## Causes
- Messaging, offers, contracts and deliveries were static Coming soon pages, with no working commands or records behind them.
- Application rows had no conversation action.
- Search combined keywords and closing dates in a single OR condition, so unrelated open jobs could match. These are now separate conditions.
- Older privacy tests did not choose seller account type, causing correct access denials. Their test setup now onboards test sellers; protections were not relaxed.

## Fixed and verified
- Buyer draft creation, editing and publication; seller keyword discovery; drafts hidden from sellers.
- Seller application submission; buyer review and shortlisting. Existing live job checks verify withdrawal restrictions and one hire per job.
- Both participants can start one conversation from an eligible application, send real messages and receive updates without reload.
- Conversation unread receipts and notification ownership passed live checks. Conversations and messages have durable storage and refresh restoration passed in the browser.
- Private attachments: upload, participant download and third-account denial passed.
- Retry request IDs: duplicate conversation and message requests return the existing record. Modified replay requests are rejected.
- Buyer offer with milestone, seller acceptance and both-party updates passed in the browser. Acceptance remains `accepted_unfunded`; direct attempts to activate funded work cannot change that state.
- Message/offer notifications and offer destination links passed in the browser.
- Unrelated third-account application, conversation, message, contract and file access denied in live checks. Suspended participant sends and reads denied.
- Existing resume ownership and account privacy checks passed. No staff access or owner roles were changed.
- Desktop messaging and 390-pixel contract view inspected; no page errors in the main end-to-end flow.
- 78 application tests passed, one existing test skipped; 21 live marketplace/job/account/resume checks passed. Latest preview build reports OK.

## Implemented but awaiting manual verification
- Failed sends have an inline error and a retained draft/request for retry, but browser fault-injection did not finish successfully. Full offline recovery is **not verified**.
- Logout/login message restoration is backed by stored records, but the separate browser check was interrupted before it finished.
- To check these: sign in as either participant, open Messages, type a message, disable your connection, send, restore your connection and retry; confirm the draft remains and only one message appears. Then log out and back in and open the same conversation.
- Actual seller withdrawal through the page was not completed in the interrupted extra browser flow; database withdrawal rules passed the job security suite.

## Blocked
- Real funding, paid-work activation, payouts and release: no payment provider is configured. No successful payment is simulated.
- Delivery submission, revision and approval: deliberately disabled for unfunded contracts; a funded delivery lifecycle still needs implementation after payment integration. Approval cannot release money.
- Email/push notification delivery is not connected; implemented notifications are in-app message/offer updates only.

## Data and publication
- Removed the tracked temporary job, private attachment and three browser test accounts. Live security fixtures were also removed by their test cleanup.
- Existing users, passwords, opportunities and private records were preserved. Nothing was publicly published.