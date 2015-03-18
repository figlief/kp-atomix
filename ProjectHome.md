## Introduction ##

kp-atomix is a javascript version of the Katomic video game that allows nearly 200 levels to be played in a Web Browser.

The game will run in any modern web browser on any operating system. It runs equally well from a USB memory stick or hard drive as it does on a server.

## Play Now ##

A Live Demo of kp-atomix can be played at [Atomix Online](http://figlief.pythonanywhere.com) or at http://kp-atomix.googlecode.com/hg/index.html

## Installation ##

To install kp-atomix on your local drive  or on a server, simply download the latest zip file from the 'Downloads' tab above and unzip it. Then open the index.html file in a browser and  play.

## Saving Levels ##

Partially completed levels and complete solutions can easily be stored as bookmarks for latter completion or reference.

## Server Support ##

You are free to to install kp-atomix on a public or   private server and customize it as you wish.  If you want to operate a site like [Atomix Online](http://figlief.pythonanywhere.com) then you should add the following line to atomix.css

```
  #success-dialog-button-save {display: inline !important;}
```

This will show a button, when a level is completed, inviting the user to submit a solution to the originating site.  When the button is clicked a page '/atomix/submit-solution/?data' will be accessed via ajax. Obviously you must have a php or cgi script
at that location to collect and store the data.

## Try It Out ##

A Live Demo of kp-atomix can be played at [Atomix Online](http://figlief.pythonanywhere.com/)

## Collected solutions for atomix and katomic puzzles ##

The [best solutions](http://figlief.pythonanywhere.com/solutions/katomic.html) for each level as submitted to the demo site can be seen at [figlief.pythonanywhere.com](http://figlief.pythonanywhere.com/solutions/katomic.html). Please note that these are not necessarily optimal solutions.

## Finding optimal solutions to atomix and Katomic puzzles ##

A paper, [Finding Optimal Solutions to Atomix](http://theinf1.informatik.uni-jena.de/~hueffner/hueffner-studienarbeit-atomix.pdf), covers this topic in depth.

