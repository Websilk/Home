CREATE PROCEDURE [dbo].[GetBlock]
	@blockId int
AS
	SELECT * FROM Blocks WHERE blockId=@blockId
