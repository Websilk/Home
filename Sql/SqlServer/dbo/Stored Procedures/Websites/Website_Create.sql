﻿-- =============================================
-- Author:		Mark Entingh
-- Create date: 5/13/2009 5:39 PM
-- Description:	Create a new website
-- =============================================
CREATE PROCEDURE [dbo].[Website_Create] 
	@ownerId int = 1, 
	@title nvarchar(100) = '',
	@description nvarchar(160) = '',
	@status int = 1,
	@logo bit = 0,
	@security bit = 0,
	@enabled bit = 1,
	@liveUrl nvarchar(255) = '',
	@stageUrl nvarchar(255) = ''
AS
BEGIN
	SET NOCOUNT ON;
    DECLARE
	@websiteId int = NEXT VALUE FOR SequenceWebsites, 
    @myDate datetime = GETDATE()
    
    -- first create the web site
    INSERT INTO Websites (
	websiteid, ownerId, title, datecreated, [status], logo, liveUrl, stageUrl, [enabled], deleted) 
	VALUES (@websiteId, @ownerId, @title, @myDate, @status, @logo, @liveUrl, @stageUrl, @enabled, 0)

	-- create home page for website
	EXEC Page_Create @ownerId=@ownerId, @websiteId=@websiteId, @parentId=0, @title='Home', 
	@description=@description, 
	@security=0, @enabled=1

	-- return the website ID
	SELECT @websiteId
END
