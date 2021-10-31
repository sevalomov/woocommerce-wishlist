A simple ajax plugin for wukomers wishlists. I'm not an expert in PHP only modifying and finishing off a ready-made plugin.

You can get acquainted with the plugin in full on the website:
https://webdesign.tutsplus.com/tutorials/how-to-create-your-own-ajax-woocommerce-wishlist-plugin--cms-34099

How does the plugin work?
- In real time, we see our wish list in a modal pop-up window. 
- Wishlist is pulled up only once, after opening the modal window, then everything happens on the kltent side.
- For unregistered users everything works through a session in the browser, and for the logged in users we
 update the arrey with the icons of our products. ( I tried to make this plugin traffic friendly :) )

What you need to run the plugin?
- Minimal knowledge of CSS, JS/Ajax and PHP (To modify according to yours needs)
- To write out our plugin in the modal window you need to insert the shortcode
	<?php echo do_shortcode('[wishlist]'); ?>
- I use bootstrap, but if you don't use bootstrap, just replace the classes and play with CSS
- For icons I use fontawesome, if you don't want to use it just replace fontawesome icons in CSS with your

That's all, a very simple plugin, if anyone suddenly read this and know how to improve the plugin, 
I would be very happy to read comments or your code ;)

https://github.com/sevalomov/