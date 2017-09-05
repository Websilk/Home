CREATE PROCEDURE [dbo].[Page_UpdateModified]
	@websiteId int = 0,
	@pageId int = 0
AS
	UPDATE Pages SET datemodified = GETDATE() WHERE websiteId=@websiteId AND pageId=@pageId