-- =============================================
-- Author:		Mark Entingh
-- Create date: 7/13/2014 12:18 am
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[GetPageList]
	@websiteId int = 0, 
	@orderby int = 1,
	@subonly bit = 0,
	@filter nvarchar(10) = '',
	@start int = 1,
	@length int = 10,
	@datestart datetime,
	@parentid int = 0,
	@pageid int = 0

AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @parentTitle nvarchar(100) = ''

	IF @subonly = 1 AND @parentid > 0 BEGIN
		-- get parent page title
		SELECT @parentTitle = title FROM pages WHERE pageid=@parentid
	END ELSE IF @subonly = 1 BEGIN
		-- get parent page title
		SELECT @parentTitle = title FROM pages WHERE pageid=@pageid
	END

    -- Insert statements for procedure here
	SELECT * INTO #tbl FROM (SELECT ROW_NUMBER() 
		OVER (ORDER BY
		CASE WHEN @orderby = 1 THEN datecreated END ASC,
		CASE WHEN @orderby = 2 THEN datecreated END DESC,
		CASE WHEN @orderby = 3 THEN datecreated END DESC,
		CASE WHEN @orderby = 4 THEN datecreated END ASC,
		CASE WHEN @orderby = 5 THEN title END ASC,
		CASE WHEN @orderby = 6 THEN title END DESC,
		CASE WHEN @orderby = 7 THEN rating END DESC 
		)	
		AS rownum, pageid, title, @parentTitle AS parenttitle, 
		datecreated, datemodified, datepublished, favorite, rating, description 
		FROM pages
		WHERE websiteid=@websiteid AND (pagetype < 3 OR pagetype IS NULL) 
		AND enabled=1 AND deleted=0
		AND pageid <> @pageid AND pageid <> @parentid
		AND title LIKE CASE WHEN @subonly=1 AND @parentid > 0 THEN '%' + @parentTitle + '%'
				ELSE CASE WHEN @subonly=1 THEN '%' + @parentTitle + '%'
				ELSE title END END
		AND (parentId = CASE WHEN @subonly=1 AND @parentid > 0 THEN @parentid
				ELSE CASE WHEN @subonly = 1 THEN @pageid 
				ELSE parentId END END
			OR (@subonly=0 AND @parentid = 0 AND parentId is null)
			)
		AND datecreated >= CASE WHEN @orderby=1 THEN @datestart ELSE DATEADD(year,-100,GETDATE()) END
		AND datecreated <= CASE WHEN @orderby=3 THEN @datestart ELSE GETDATE() END
		
		AND datecreated < datepublished

) AS tbl WHERE rownum >= @start AND rownum < @start + @length

IF (SELECT COUNT(*) FROM #tbl) = 0 AND @orderby = 1 BEGIN
	EXEC GetPageList @websiteId, 2, @subonly, @filter, @start, @length, @datestart, @parentid, @pageid
END 
	ELSE
	SELECT * FROM #tbl
END