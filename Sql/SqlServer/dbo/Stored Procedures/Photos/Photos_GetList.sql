-- =============================================
-- Author:		Mark Entingh
-- Create date: 7/24/2015 1:30 PM
-- Description:	Get a list of photos for a given website
-- =============================================
CREATE PROCEDURE [dbo].[Photos_GetList] 
	@websiteId int = 0,
	@folder nvarchar(25) = '',
	@start int = 1,
	@length int = 100,
	@orderby int = 1,
	@filenames nvarchar(MAX) = ''
AS
BEGIN
	SET NOCOUNT ON;
	SELECT folderId, name INTO #folders FROM PhotoFolders WHERE websiteid=@websiteId
	DECLARE @folderId int = 0
	SELECT @folderId = folderId FROM #folders WHERE name=@folder
	
	IF LEN(@filenames) > 0 BEGIN

	SELECT * INTO #filenames FROM dbo.SplitArray(@filenames, ',')

	SELECT * FROM (
		SELECT ROW_NUMBER() 
			OVER (ORDER BY folderId, 
			CASE WHEN @orderby = 1 THEN p.datecreated END DESC,
			CASE WHEN @orderby = 2 THEN p.datecreated END ASC,
			CASE WHEN @orderby = 3 THEN (p.width * p.height) END DESC, -- largest to smallest
			CASE WHEN @orderby = 4 THEN (p.width * p.height) END ASC  -- smallest to largest
			)	
			AS rownum, folderId, 
			(SELECT name FROM #folders WHERE folderId=p.folderId) AS folderName,
			[filename], width, height, datecreated
			FROM photos p WHERE p.websiteId=@websiteId 
			AND p.filename IN (SELECT value FROM #filenames)
		) 
	AS tbl WHERE rownum >= @start AND rownum < @start + @length
	
	END ELSE BEGIN

		SELECT * FROM (
			SELECT ROW_NUMBER() 
				OVER (ORDER BY folderId, 
				CASE WHEN @orderby = 1 THEN p.datecreated END DESC,
				CASE WHEN @orderby = 2 THEN p.datecreated END ASC,
				CASE WHEN @orderby = 3 THEN (p.width * p.height) END DESC, -- largest to smallest
				CASE WHEN @orderby = 4 THEN (p.width * p.height) END ASC  -- smallest to largest
				)	
				AS rownum, folderId, 
				(SELECT name FROM #folders WHERE folderId=p.folderId) AS folderName,
				[filename], width, height, datecreated
				FROM photos p WHERE p.websiteId=@websiteId 
				AND folderId = CASE WHEN @folderId > 0 THEN @folderId ELSE folderId END
			) 
		AS tbl WHERE rownum >= @start AND rownum < @start + @length
	END

END