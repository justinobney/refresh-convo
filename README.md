Refresh BR | Convo App
======

This is my attempt to build an app with the intention of learning NodeJS

This is a port of the idea if got from Dave Carner (https://github.com/carnedv/refresh-convo).
My goal differs from Dave's as I am new to Node and taking it slow to learn the basics first.

Quick Feature List
* Parse.com as data store
* Parse User Verification
* Ensure user is logged in
* Sign in with:
	* Github
	* Google
	* Twitter - TODO: issue with live site
	* Facebook - TODO
* Link Sharing
	* Send links to server via POST (I don't know how I feel about using web sockets for all data submission)
	* Link is saved to Parse and event is new link is broadcast via Socket.io
	* Link URL is sent to service to grab screen shot of site and crop image
		* Cropped image is saved to parse
		* Corresponding link is updated with new imageUrl
		* New imageUrl is broadcast via Socket.io -> Page updates

TODO:
---

* Create admin section
* Catagorize links under meetings / topics
* Implement the chat room
* Learn AngularJS and rewrite structure
* Finish implementing service & repository structure in code


See app in progress @ http://jobney-refresh.herokuapp.com/
