-- =============================================
-- Author:		Mark Entingh
-- Create date: 7/9/2014 2:02 am
-- Description:	get a list of parent pages that belong a website
-- =============================================
CREATE PROCEDURE [dbo].[GetPageParents] 
	@websiteId int = 0,
	@orderby int = 0
AS
BEGIN
	SET NOCOUNT ON;
	SELECT pageid, title, datecreated 
	FROM pages WHERE websiteid=@websiteId 
	AND pageid IN 
		(SELECT DISTINCT parentid FROM pages 
		WHERE websiteid = @websiteId AND enabled=1 AND deleted=0 AND parentid IS NOT null)
	AND enabled=1 AND deleted=0
	ORDER BY 
		CASE WHEN @orderby = 0 THEN datecreated END ASC,
		CASE WHEN @orderby = 1 THEN datecreated END DESC,
		CASE WHEN @orderby = 2 THEN title END ASC,
		CASE WHEN @orderby = 3 THEN title END DESC

END
