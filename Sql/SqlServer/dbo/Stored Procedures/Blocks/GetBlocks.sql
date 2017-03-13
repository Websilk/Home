CREATE PROCEDURE [dbo].[GetBlocks]
	@websiteId int,
	@area nvarchar(16)
AS
	SELECT * FROM Blocks 
	WHERE websiteId=@websiteId 
	AND area = CASE WHEN @area = '' THEN area ELSE @area END