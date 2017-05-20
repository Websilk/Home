-- =============================================
-- Author:		Mark Entingh
-- Create date: 7/24/2015 12:30 PM
-- Description:	delete array of photos after removing from disk
-- Separate each file with a comma in @filenames
-- =============================================
CREATE PROCEDURE [dbo].[Photos_Delete] 
	@websiteId int = 0,
	@filenames nvarchar(MAX) = ''
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @value nvarchar(MAX), @cursor CURSOR
	SET @cursor = CURSOR FOR SELECT value FROM dbo.SplitArray(@filenames,',') AS tbl
	OPEN @cursor
	FETCH FROM @cursor INTO @value
	WHILE @@FETCH_STATUS = 0 BEGIN
		DELETE FROM Photos WHERE websiteId=@websiteId AND [filename]=@value
		FETCH FROM @cursor INTO @value
	END
	CLOSE @cursor
	DEALLOCATE @cursor

	
END