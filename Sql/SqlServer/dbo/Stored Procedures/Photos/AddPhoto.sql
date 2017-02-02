-- =============================================
-- Author:		Mark Entingh
-- Create date: 7/24/2015 12:30 PM
-- Description:	Add photo after uploading
-- =============================================
CREATE PROCEDURE [dbo].[AddPhoto] 
	@websiteId int = 0,
	@folder nvarchar(25) = '',
	@filename nvarchar(25) = '',
	@uploadname nvarchar(25) = '',
	@width int = 0,
	@height int = 0
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @folderId int = 0
	SELECT @folderId = folderId FROM PhotoFolders WHERE websiteId=@websiteId AND name=@folder
	INSERT INTO Photos (websiteId, folderId, [filename], uploadname, width, height, datecreated)
	VALUES(@websiteId, @folderId, @filename, @uploadname, @width, @height, GETDATE())
END