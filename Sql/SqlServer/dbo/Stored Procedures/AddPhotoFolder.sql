-- =============================================
-- Author:		Mark Entingh
-- Create date: 7/24/2015 2:00 PM
-- Description:	Add folder to upload photos into
-- =============================================
CREATE PROCEDURE [dbo].[AddPhotoFolder] 
	@websiteId int = 0,
	@name nvarchar(25) = ''
AS
BEGIN
	SET NOCOUNT ON;
	INSERT INTO PhotoFolders (folderId, websiteId, name, datecreated)
	VALUES(NEXT VALUE FOR SequencePhotoFolders, @websiteId, @name, GETDATE())
END