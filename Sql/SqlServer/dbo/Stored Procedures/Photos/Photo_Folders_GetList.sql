-- =============================================
-- Author:		Mark Entingh
-- Create date: 7/24/2015 4:45 PM
-- Description:	Get a list of photo folders 
-- =============================================
CREATE PROCEDURE [dbo].[Photo_Folders_GetList] 
	@websiteId int = 0
AS
BEGIN
	SET NOCOUNT ON;
	SELECT folderId, name FROM PhotoFolders WHERE websiteId=@websiteId ORDER BY name ASC

	
END