CREATE PROCEDURE [dbo].[Page_History_Create]
	@websiteId int = 0,
	@pageId int = 0,
	@userId int = 0,
	@datemodified datetime = NULL
AS
	IF @datemodified IS NULL BEGIN SET @datemodified = GETDATE() END
	INSERT INTO Pages_History (websiteId, pageId, userId, datemodified) 
	VALUES (@websiteId, @pageId, @userId, @datemodified)
