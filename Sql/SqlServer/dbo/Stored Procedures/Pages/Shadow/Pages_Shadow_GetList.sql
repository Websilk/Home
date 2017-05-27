CREATE PROCEDURE [dbo].[Pages_Shadow_GetList]
	@websiteId int
AS
	SELECT pageId, title
	FROM Pages
	WHERE websiteId=@websiteId
	AND pagetype=4