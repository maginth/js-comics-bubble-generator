Comics Bubble Generator –  A client side javascript generator
==============

***Fast hight quality generation. No data, just js, save your network bandwidth !***

![preview](http://aekuo.com/mathieu/bubble/preview.jpg "preview")  


## LIVE DEMO

*You can drag the bubbles !*  
1. [Preview](http://aekuo.com/mathieu/bubble/preview_example.html)  
2. [Tail Styles](http://aekuo.com/mathieu/bubble/bulle_example.html)  

## API  

### Create a bubble generator :

	var b = Bulle(type, base, margin_side, margin_target)
	
type : 0 Straight tail, 1 Rounded tail, 2 Curved tail  
base : tail base width in pixel  
margin_side : min margin from the nearest side 0 to 0.5  
margin_target : margin between the target and the tail end in pixel  

### Connect two DOM element :

	b.bulleConnect(source, dest [, canvas])

source : tail base DOM element  
dest : tail targeted DOM element  
canvas : recycle a previous canvas element for redrawing  


### Add a tail to a DOM element :

	b.bulleAt(source, x, y, w, h [, canvas])

source : tail base DOM element  
x, y, w, h : position and size of the virtual target (you can set w = h = 0)  
canvas : recycle a previous canvas element for redrawing  

## Further documentation  

Ask me !