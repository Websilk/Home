CREATE PROCEDURE [dbo].[Block_Get]
	@blockId int
AS
	SELECT * FROM Blocks WHERE blockId=@blockId
