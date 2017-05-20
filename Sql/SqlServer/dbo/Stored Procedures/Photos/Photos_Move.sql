-- =============================================
-- Author:		Mark Entingh
-- Create date: 7/24/2015 4:30 PM
-- Description:	move photos from one folder to another
-- =============================================
CREATE PROCEDURE [dbo].[Photos_Move] 
	@websiteId int = 0,
	@filenames nvarchar(MAX) = '',
	@folder nvarchar(25) = ''
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @value nvarchar(MAX), @folderId int = 0, @cursor CURSOR
	SELECT @folderId = folderId FROM PhotoFolders WHERE websiteId=@websiteId AND name=@folder
	SET @cursor = CURSOR FOR SELECT value FROM dbo.SplitArray(@filenames,',') AS tbl
	OPEN @cursor
	FETCH FROM @cursor INTO @value
	WHILE @@FETCH_STATUS = 0 BEGIN
		UPDATE Photos SET folderId=@folderId 
		WHERE websiteId=@websiteId AND [filename]=@value
		FETCH FROM @cursor INTO @value
	END
	CLOSE @cursor
	DEALLOCATE @cursor

	
END