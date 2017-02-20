-- =============================================
-- Author:		Mark Entingh
-- Create date: 7/10/2009
-- Description:	Create a new web page
-- =============================================
CREATE PROCEDURE [dbo].[AddPage] 
	@ownerId int = 0, 
	@websiteId int = 0,
	@parentid int = 0,
	@title nvarchar(250) = '',
	@description nvarchar(160) = '',
	@pagetype int = 0,
	@layout nvarchar(30) = '',
	@service nvarchar(100) = '',
	@security bit = 0,
	@enabled bit = 1
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @pageId int,
			@websiteOwnerId int = 0, 
			@path nvarchar(MAX), 
			@pathIds nvarchar(MAX),
			@datenow datetime

	SELECT @websiteOwnerId = ownerId FROM WebSites WHERE websiteId=@websiteId AND ownerId=@ownerId
	SET @datenow = GETDATE()
	SET @pageId = NEXT VALUE FOR SequencePages

	INSERT INTO Pages (pageId, ownerId, parentid, pagetype, websiteId, title, [path], pathIds,
	datecreated, datemodified, datepublished, security, published, layout, [service],
	rating, ratingtotal, ratingcount, description, enabled, deleted) 
	VALUES(@pageId, @websiteOwnerId, @parentid, @pagetype, @websiteId, @title, '', '',
	@datenow, @datenow, @datenow, @security, 0, @layout, @service, 0, 0, 0, @description, @enabled, 0)

	/* update page heirarchy paths for title & ids */
	UPDATE pages SET path=dbo.GetPagePath(@pageId), pathIds=dbo.GetPagePathIds(@pageId) WHERE pageid=@pageid
	
	RETURN @pageId
END
