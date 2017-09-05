-- =============================================
-- Author:		Mark Entingh
-- Create date: 7/10/2009
-- Description:	Create a new web page
-- =============================================
CREATE PROCEDURE [dbo].[Page_Create] 
	@ownerId int = 0, 
	@websiteId int = 0,
	@parentid int = 0,
	@title nvarchar(250) = '',
	@description nvarchar(160) = '',
	@security bit = 0,
	@enabled bit = 1
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @pageId int,
			@websiteOwnerId int = 0, 
			@pathIds nvarchar(MAX),
			@datenow datetime

	SELECT @websiteOwnerId = ownerId FROM WebSites WHERE websiteId=@websiteId AND ownerId=@ownerId
	SET @datenow = GETDATE()
	SET @pageId = NEXT VALUE FOR SequencePages

	INSERT INTO Pages (pageId, ownerId, parentid, websiteId, title, [path], pathIds,
	datecreated, datemodified, [security],[description], [enabled], deleted) 
	VALUES(@pageId, @websiteOwnerId, @parentid, @websiteId, @title, '', '',
	@datenow, @datenow, @security, @description, @enabled, 0)

	/* update page heirarchy paths for title & ids */
	SET @pathIds = dbo.GetPagePathIds(@pageId)
	SELECT * INTO #paths FROM dbo.SplitArray(@pathIds,'/')
	UPDATE pages SET path=dbo.GetPagePath(@pageId), pathIds=@pathIds, pathlvl=(SELECT COUNT(*) FROM #paths) WHERE pageid=@pageid
	DROP TABLE #paths
	
	RETURN @pageId
END