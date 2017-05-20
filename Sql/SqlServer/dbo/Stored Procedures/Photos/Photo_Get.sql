-- =============================================
-- Author:		Mark Entingh
-- Create date: 7/26/2015 6:35 PM
-- Description:	Get info about a photo
-- =============================================
CREATE PROCEDURE [dbo].[Photo_Get] 
	@websiteId int = 0,
	@filename nvarchar(20) = ''
AS
BEGIN
	SET NOCOUNT ON;
	SELECT p.*, f.name AS foldername FROM photos p LEFT JOIN PhotoFolders f ON f.folderId =p.folderId WHERE p.websiteId = @websiteId AND p.filename=@filename

END