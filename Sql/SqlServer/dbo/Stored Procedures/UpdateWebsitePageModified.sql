CREATE PROCEDURE [dbo].[UpdateWebsitePageModified]
	@websiteId int = 0,
	@pageId int = 0
AS
	UPDATE Pages SET datemodified = GETDATE(), [version] += 1 WHERE websiteId=@websiteId AND pageId=@pageId