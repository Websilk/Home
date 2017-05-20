CREATE PROCEDURE [dbo].[Blocks_GetList]
	@websiteId int,
	@area nvarchar(16)
AS
	SELECT * FROM Blocks 
	WHERE websiteId=@websiteId 
	AND area = CASE WHEN @area = '' THEN area ELSE @area END