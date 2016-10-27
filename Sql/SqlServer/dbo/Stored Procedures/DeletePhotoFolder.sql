-- =============================================
-- Author:		Mark Entingh
-- Create date: 7/24/2015 2:15 PM
-- Description:	Add folder to upload photos into
-- =============================================
CREATE PROCEDURE [dbo].[DeletePhotoFolder] 
	@websiteId int = 0,
	@folder nvarchar(25) = ''
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @folderId int = 0
	SELECT @folderId = folderId FROM PhotoFolders WHERE websiteId=@websiteId AND name=@folder
	DELETE FROM Photos WHERE websiteId=@websiteId AND folderId=@folderId
	DELETE FROM PhotoFolders WHERE websiteId=@websiteId AND folderId=@folderId
END