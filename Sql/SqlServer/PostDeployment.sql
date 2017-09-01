﻿SET NOCOUNT ON

/* Only Add initial data once */
IF (SELECT COUNT(*) FROM Users WHERE userId=1) = 0 BEGIN

	/* Setup Variable */
	DECLARE 
	@websiteId int = 0,
	@websiteTitle nvarchar(100) = 'Websilk',
	@pageDescription nvarchar(MAX) = 'Welcome to your new website, generated by the Websilk platform.'

	/* Create Default Administration Account */
	EXEC AddUser @email='admin@localhost', @password='', @displayname='admin', @photo='', @status=1

	/* Create Default Website */
	EXEC @websiteId = AddWebsite @ownerId=1, @title=@websiteTitle, @theme='default', @colors='beach', @colorsEditor='dark', @colorsDash='aqua', @description=@pageDescription, 
					@status=1, @icon=1, @security=0, @enabled=1, @domainname='websilk.com'
	
	/* Setup Available Components */
	INSERT INTO components (componentId, [namespace], title, category, [description], datecreated, orderindex)
	VALUES ('textbox', 'Textbox', 'Text', 1, 'Write formatted text directly onto your web page.', GETDATE(), 1)

	INSERT INTO components (componentId, [namespace], title, category, [description], datecreated, orderindex)
	VALUES ('panel', 'Panel', 'Panel', 1, 'Add content to a grid or slideshow.', GETDATE(), 2)

	INSERT INTO components (componentId, [namespace], title, category, [description], datecreated, orderindex)
	VALUES ('photo', 'Photo', 'Photo', 1, 'Upload an image from your computer to display and resize on the page', GETDATE(), 3)

	INSERT INTO components (componentId, [namespace], title, category, [description], datecreated, orderindex)
	VALUES ('photogallery', 'PhotoGallery', 'Photo Gallery', 1, 'Display a list of photos in a grid or slideshow.', GETDATE(), 4)

	INSERT INTO components (componentId, [namespace], title, category, [description], datecreated, orderindex)
	VALUES ('video', 'Video', 'Video Player', 1, 'Display a video from YouTube or Vimeo.', GETDATE(), 5)

	INSERT INTO components (componentId, [namespace], title, category, [description], datecreated, orderindex)
	VALUES ('music', 'Music', 'Music Player', 1, 'Load a playlist from SoundCloud.', GETDATE(), 6)

	INSERT INTO components (componentId, [namespace], title, category, [description], datecreated, orderindex)
	VALUES ('menu', 'Menu', 'Menu', 1, 'Create a navigation menu with links to other web pages.', GETDATE(), 7)

	INSERT INTO components (componentId, [namespace], title, category, [description], datecreated, orderindex)
	VALUES ('list', 'List', 'List', 1, 'Create a customized list of information using text, photos, buttons, and HTML.', GETDATE(), 8)

	INSERT INTO components (componentId, [namespace], title, category, [description], datecreated, orderindex)
	VALUES ('button', 'Button', 'Button', 1, 'Add a button to your web page.', GETDATE(), 9)

	INSERT INTO components (componentId, [namespace], title, category, [description], datecreated, orderindex)
	VALUES ('page-title', 'PageTitle', 'Page Title', 2, 'Display the title & description for your web pages instead of manually writing text on each page.', GETDATE(), 1)

	INSERT INTO components (componentId, [namespace], title, category, [description], datecreated, orderindex)
	VALUES ('page-list', 'PageList', 'Page List', 2, 'Display a list of relevant web pages.', GETDATE(), 2)

	INSERT INTO components (componentId, [namespace], title, category, [description], datecreated, orderindex)
	VALUES ('page-comments', 'Comments', 'Comments', 2, 'Give visitors a way to leave feedback on your page with Disqus or Facebook comments.', GETDATE(), 3)

	INSERT INTO components (componentId, [namespace], title, category, [description], datecreated, orderindex)
	VALUES ('page-maps', 'Maps', 'Maps', 2, 'Add a Google map to provide a location to your business or venue.', GETDATE(), 4)

	INSERT INTO components (componentId, [namespace], title, category, [description], datecreated, orderindex)
	VALUES ('payments', 'Payments', 'Payments', 2, 'Add a buy button from Paypal or Stripe onto your web page.', GETDATE(), 5)

END