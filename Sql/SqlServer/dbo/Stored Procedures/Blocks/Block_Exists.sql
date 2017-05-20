CREATE PROCEDURE [dbo].[Block_Exists]
	@websiteId int,
	@name nvarchar(30)
AS
	SELECT COUNT(*) FROM Blocks WHERE websiteId=@websiteId AND name=@name
