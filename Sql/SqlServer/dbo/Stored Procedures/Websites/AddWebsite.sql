-- =============================================
-- Author:		Mark Entingh
-- Create date: 5/13/2009 5:39 PM
-- Description:	Create a new website
-- =============================================
CREATE PROCEDURE [dbo].[AddWebsite] 
	@ownerId int = 1, 
	@title nvarchar(100) = '',
	@theme nvarchar(25) = '',
	@colors nvarchar(25) = '',
	@colorsEditor nvarchar(25) = '',
	@colorsDash nvarchar(25) = '',
	@description nvarchar(160) = '',
	@status int = 1,
	@icon bit = 0,
	@security bit = 0,
	@enabled bit = 1,
	@domainname nvarchar(25) = '',
    @subdomain nvarchar(25) = '',
	@googletoken varchar(max)='',
	@googleprofileId varchar(20) = '',
	@googlewebpropertyId varchar(20) = '',
	@platformDomain nvarchar(100) = 'websilk.com'
AS
BEGIN
	SET NOCOUNT ON;
    DECLARE
	@websiteId int, 
    @templateId int,
    @dashId int,
    @homeId int,
    @loginId int,
	@aboutId int,
	@contactId int,
	@supportId int,
    @404Id int,
    @deniedId int,
    @myDate datetime = GETDATE()
    
    -- first create the web site
    INSERT INTO WebSites (
	websiteid, ownerId, title, theme, colors, colorsEditor, colorsDash, datecreated, 
	pagetemplate, pagedash, pagehome, pagelogin, pageabout, pagecontact, pagesupport, page404, pagedenied,
	[status], icon, [enabled], deleted) 
	VALUES (
	NEXT VALUE FOR SequenceWebsites, @ownerId, @title, @theme, @colors, @colorsEditor, @colorsDash, @myDate, 
	0, 0, 0, 0, 0, 0, 0, 0, 0, @status, @icon, @enabled, 0)
    
    SELECT TOP 1 @websiteId = websiteId FROM WebSites WHERE ownerId=@ownerId ORDER BY websiteId DESC

	-- include a domain name
	IF @domainname <> ''
	BEGIN
		INSERT INTO WebsiteDomains (websiteid, domain, datecreated, googletoken, googleprofileId, googlewebpropertyId)
		VALUES (@websiteId, @domainname, GETDATE(),@googletoken, @googleprofileId, @googlewebpropertyId)
	END
	
	-- include a sub domain
	IF @subdomain <> ''
	BEGIN
		INSERT INTO WebsiteSubDomains (websiteid, subdomain, domain, datecreated)
		VALUES (@websiteId, @subdomain, @platformDomain, GETDATE())
	END

	-- create default pages
	EXEC @dashId = AddWebsitePage @ownerId=@ownerId, @websiteId=@websiteId, @parentId=0, @title='Dashboard', @description=@description, @pagetype=1, @service='Dashboard', @security=1, @enabled=1
	EXEC @homeId = AddWebsitePage @ownerId=@ownerId, @websiteId=@websiteId, @parentId=0, @title='Home', @description=@description, @pagetype=0, @security=0, @enabled=1
	EXEC @loginId = AddWebsitePage @ownerId=@ownerId, @websiteId=@websiteId, @parentId=0, @title='Login', @description=@description, @pagetype=0, @security=0, @enabled=1
	EXEC @aboutId = AddWebsitePage @ownerId=@ownerId, @websiteId=@websiteId, @parentId=0, @title='About', @description=@description, @pagetype=0, @security=0, @enabled=1
	EXEC @contactId = AddWebsitePage @ownerId=@ownerId, @websiteId=@websiteId, @parentId=0, @title='Contact', @description=@description, @pagetype=0, @security=0, @enabled=1
	EXEC @supportId = AddWebsitePage @ownerId=@ownerId, @websiteId=@websiteId, @parentId=0, @title='Support', @description=@description, @pagetype=0, @security=0, @enabled=1
	EXEC @404Id = AddWebsitePage @ownerId=@ownerId, @websiteId=@websiteId, @parentId=0, @title='Error 404', @description=@description, @pagetype=0, @security=0, @enabled=1
	EXEC @deniedId = AddWebsitePage @ownerId=@ownerId, @websiteId=@websiteId, @parentId=0, @title='Access Denied', @description=@description, @pagetype=0, @security=0, @enabled=1
	EXEC @templateId = AddWebsitePage @ownerId=@ownerId, @websiteId=@websiteId, @parentId=0, @title='Template', @description=@description, @pagetype=4, @security=1, @enabled=0
	
	-- save default pages IDs to website table
	UPDATE WebSites SET 
	pagetemplate=@templateId, pagedash=@dashId, pagehome=@homeId, pagelogin=@loginId, pageabout=@aboutId, 
	pagecontact=@contactId, pagesupport=@supportId, page404=@404Id, pagedenied=@deniedId
	WHERE websiteId=@websiteId
	
	-- return the website ID
	SELECT @websiteId
END
