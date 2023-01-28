# DVD Logo Game

#### Startup project for CS 260 - BYU Winter 2023

---

### STARTUP SPECIFICATIONS

What is more exciting than watching the DVD logo hit the corner of the screen? How about using that knowledge to garner some bragging rights! The DVD Logo Game allows you to do just that. Go head-to-head with some friends (or even some strangers if you are feeling confident) to see who can choose the safest place to be as the DVD logo traverses the screen. Everyone will pick a location to place their icon before the DVD logo starts moving. Once it does, it will go and eliminate each player it comes into contact with. The last player standing wins!

![Here is a test image.](/images/specification/abyss_by_t1na_dck7m2r.jpg)
![Here is the second test image.](/images/specification/breathe_again_by_t1na_dalxy0v.jpg)
![Here is the last test image.](/images/specification/light_by_t1na_d9la8qm.jpg)

#### Key features:
 - Ability to create a room or to join an existing one
 - Ability to choose location for player icon before starting game
 - Display of current players in room and their number of wins
 - Win record of player is persistently stored
 - Chance of witnessing the DVD logo hitting the corner of the screen
 - Secure login over HTTPS

---

### AWS NOTES

`public IP address: 3.133.187.35`

`ssh -i [path to key] ubuntu@3.133.187.35`

The server is set up with an elastic IP address so that in the case that the server goes offline or needs to reboot or something like that, it will keep the same IP address.
