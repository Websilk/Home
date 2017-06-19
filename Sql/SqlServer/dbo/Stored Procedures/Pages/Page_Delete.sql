CREATE PROCEDURE [dbo].[Page_Delete]
	@websiteId int,
	@pageId int
AS
	DECLARE @path nvarchar(MAX) = ''
	SELECT @path = pathIds FROM Pages WHERE pageId=@pageId AND websiteId=@websiteId
	IF @path != '' BEGIN
		UPDATE Pages SET deleted=1 WHERE (pathIds LIKE @path + '/%' OR pageId=@pageId) AND websiteId=@websiteId
	END
