# DVD Logo Game

#### Startup project for CS 260 - BYU Winter 2023

---

### STARTUP SPECIFICATIONS

What is more exciting than watching the DVD logo hit the corner of the screen? How about using that knowledge to garner some bragging rights! The DVD Logo Game allows you to do just that. Go head-to-head with some friends (or even some strangers if you are feeling confident) to see who can choose the safest place to be as the DVD logo traverses the screen. Everyone will pick a location to place their icon before the DVD logo starts moving. Once it does, it will go and eliminate each player it comes into contact with. The last player standing wins!

![Rough sketch of different screens of application](/images/specification/rough%20sketch.jpg)

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

---

### SIMON HTML NOTES

When starting a new `html` file, type `html-5` and let VSCode autofill the framework to build the page. This will include empty `<head>` and `<body>` sections as well as the correct `<!DOCTYPE>` at the beginning.

`./deployFiles.sh -k [path to key] -h jonahaustin.click -s simon`

This command in GitBash will run the bash script `deployFiles` which will connect to the server, wipe the old simon files, and copy over the new ones.
 
I often want to split things up into a series of `<p>` blocks in order to distinguish elements on a page. This can also be done using `<div></div> <br/>` elements, or a series of `<div>` and `<br/>` elements.
 
SVGs ARE PRETTY DIFFICULT TO DO BY HAND!! - - use free external editors for this


---

### HTML/CSS STARTUP DELIVERABLE NOTES

RESPONSIVENESS
 - Control responsiveness to width by having an outer parent container whose width you control using @media and then using relative sizing amongst the child elements
 - TODO: Why am I getting the bug of the header and the body being larger than the viewport EVEN THOUGH their CSS styling lists them as a width of 100%? Their parent objects should be set to the viewport width.
 - USING GRIDS INSTEAD OF TABLES WORKS OUT REALLY WELL
