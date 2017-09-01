-- =============================================
-- Author:		Mark Entingh
-- Create date: 5/13/2009 5:39 PM
-- Description:	Create a new website
-- =============================================
CREATE PROCEDURE [dbo].[Website_Create] 
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
	@domainname nvarchar(25) = ''
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
	websiteid, ownerId, title, datecreated, [status], icon, [enabled], deleted) 
	VALUES (
	NEXT VALUE FOR SequenceWebsites, @ownerId, @title, @theme, @colors, @colorsEditor, @colorsDash, @myDate, 
	0, 0, 0, 0, 0, 0, 0, 0, 0, @status, @icon, @enabled, 0)
    
    SELECT TOP 1 @websiteId = websiteId FROM WebSites WHERE ownerId=@ownerId ORDER BY websiteId DESC

	-- return the website ID
	SELECT @websiteId
END
