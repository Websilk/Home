CREATE PROCEDURE [dbo].[Block_History_Create]
	@websiteId int = 0,
	@blockId int = 0,
	@userId int = 0,
	@datemodified datetime = NULL
AS
	IF @datemodified IS NULL BEGIN SET @datemodified = GETDATE() END
	INSERT INTO Blocks_History (websiteId, blockId, userId, datemodified) 
	VALUES (@websiteId, @blockId, @userId, @datemodified)
