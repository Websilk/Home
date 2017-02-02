-- =============================================
-- Author:		Mark Entingh
-- Create date: 5/23/2012 1:02 PM
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[LogRequest] 
	@websiteid int = 0,
	@pageid int = 0, 
	@loadtime int = 0,
	@ajax bit = 0,
	@visitorid nvarchar(5) = '',
	@userid nvarchar(10) = '',
	@ipaddress nvarchar(25) = '',
	@domain nvarchar(50) = '',
	@url nvarchar(200) = '',
	@agent nvarchar(200) = '',
	@referrer nvarchar(200) = '',
	@components int = 0,
	@apps int = 0,
	@layers int = 0,
	@sqlqueries int = 0,
	@ctext int = 0,
	@cphotos int = 0,
	@cgalleries int = 0,
	@cpanels int = 0,
	@cmenus int = 0,
	@firstvisit bit = 0
AS
BEGIN
	INSERT INTO dbo.log 
	(websiteid, pageid, loadtime, ajax, visitorid, userid, ipaddress, domain, url, 
	agent, referrer, firstvisit, components, apps, layers, sqlqueries, 
	ctext, cphotos, cgalleries, cpanels, cmenus, datecreated)
	VALUES 
	(@websiteid, @pageid, @loadtime, @ajax, @visitorid, @userid, @ipaddress, @domain, @url, 
	@agent, @referrer, @firstvisit, @components, @apps, @layers, @sqlqueries,
	@ctext, @cphotos, @cgalleries, @cpanels, @cmenus, GETDATE()) 
END




