-- =============================================
-- Author:		Mark Entingh
-- Create date: 7/13/2014 12:18 am
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[Pages_GetList]
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
			CASE WHEN @orderby = 0 THEN p.datecreated END ASC,
			CASE WHEN @orderby = 1 THEN p.datecreated END DESC,
			CASE WHEN @orderby = 2 THEN p.datemodified END ASC,
			CASE WHEN @orderby = 3 THEN p.datemodified END DESC,
			CASE WHEN @orderby = 4 THEN p.title END ASC,
			CASE WHEN @orderby = 5 THEN p.title END DESC,
			CASE WHEN @orderby = 6 THEN p.[security] END DESC
		) as rownum, 
		p.*, (SELECT COUNT(*) FROM pages WHERE websiteid=@websiteId AND parentid=p.pageid) AS haschildren,
		t.title AS templateName, t.path AS templatePath
		FROM pages p
		LEFT JOIN pages t ON t.pageId=p.shadowId
		WHERE p.websiteId=@websiteId AND p.pagetype=0 AND p.[enabled]=1 AND p.[deleted]=0 
		AND p.[security] = CASE WHEN @orderby = 6 THEN 1 ELSE p.[security] END
		AND p.parentId = @parentId
	) AS mytbl
	WHERE rownum BETWEEN @start AND @start + @length ORDER BY haschildren DESC
END