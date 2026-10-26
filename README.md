# Lowest Bet Bike Race — Unity 3D starter source

This is a source-code starter for a 3-rider mountain-bike race inspired by the supplied screenshot. It is not the original game's source code and is not a ready-made APK. The project uses Unity C# scripts and simple waypoint racing so you can create your own scene.

## Rules implemented
- Three cyclists race along a waypoint track.
- Riders change lateral lane positions at irregular intervals, creating visible crossings/overtakes.
- Each rider has a `virtualBet` amount.
- The rider with the lowest virtual bet is the winner.
- The lowest-bet rider gets a small boost near the final waypoints so the ending visually supports the rule.
- When all riders finish, the game enters slow motion and then reveals the lowest-bet winner.
- This starter only uses virtual coins. No real-money betting or payment integration is included.

## Unity setup
1. Install Unity Hub and a current Unity 3D project template. Create a 3D project.
2. Copy `Assets/Scripts` from this package into your Unity project's `Assets/Scripts` folder.
3. Create a track with a wide dirt-road surface. Add empty GameObjects along the center of the track in order: `WP_00`, `WP_01`, `WP_02`, ... `WP_FINISH`. Place them on the bends and keep them above the road surface.
4. Create 3 cyclist objects (models or temporary capsules). Orient each model so its forward direction is Unity's blue Z axis. Add `CyclistRacer` to each.
5. On each cyclist, assign the same ordered waypoint transforms to `waypoints`. Set different `riderName`, `virtualBet` and `riderColor` values. Example bets: Rider A = 10, Rider B = 20, Rider C = 30.
6. Create an empty GameObject named `RaceManager` and add `RaceManager.cs`. Add all three cyclists to its `riders` list.
7. Optional UI: create a Canvas with legacy UI Text fields for status/result/bets. Assign `statusText` and `resultText` on RaceManager. Add `RaceHUD` to a UI object, assign the manager and bets Text, then connect UI Button OnClick to `RaceHUD.StartRaceButton` and `RaceHUD.ResetRaceButton`.
8. Press Play and call `StartRace()` (or use the UI button).

## Important tuning notes
- The lane-crossing effect is most visible on a broad track. Increase `laneWidth` carefully so riders do not leave the road.
- `finishDistance` should be large enough for the riders to reach each waypoint. For long tracks, use more waypoints around bends.
- This simple prototype moves rider objects using transforms. Add colliders, a proper bike controller, animations, sound, camera follow, mobile touch controls and polished models for a production-quality game.
- For Unity UI Text, use `UnityEngine.UI.Text`. If using TextMeshPro, change the script field types to `TMP_Text` and add `using TMPro;`.
