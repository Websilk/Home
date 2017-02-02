-- =============================================
-- Author:		Mark Entingh
-- Create date: 8/31/2008
-- Update date: 11/15/2016
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[GetPagesForWebsite] 
	@websiteId int = 0,
	@parentId int = 0,
	@start int = 1,
	@length int = 9,
	@orderby int = 0,
	@search nvarchar(25) = ''
AS
BEGIN
	SELECT * FROM (
		SELECT ROW_NUMBER() OVER(ORDER BY 
			CASE WHEN @orderby = 0 THEN datecreated END ASC,
			CASE WHEN @orderby = 1 THEN datecreated END DESC,
			CASE WHEN @orderby = 2 THEN datemodified END ASC,
			CASE WHEN @orderby = 3 THEN datemodified END DESC,
			CASE WHEN @orderby = 4 THEN title END ASC,
			CASE WHEN @orderby = 5 THEN title END DESC,
			CASE WHEN @orderby = 6 THEN [security] END DESC
		) as rownum, 
		p.*, (SELECT COUNT(*) FROM pages WHERE websiteid=@websiteId AND parentid=p.pageid) AS haschildren 
		FROM pages p WHERE
		p.websiteId=@websiteId AND p.[enabled]=1 AND p.[deleted]=0 
		AND p.[security] = CASE WHEN @orderby = 6 THEN 1 ELSE p.[security] END
		AND p.parentId = @parentId
	) AS mytbl
	WHERE rownum BETWEEN @start AND @start + @length ORDER BY haschildren DESC
END
