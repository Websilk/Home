-- =============================================
-- Author:		Mark Entingh
-- Create date: 10/5/2008
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[Websites_GetList] 
	@userId int = 0, 
	@start int = 0,
	@length int = 12,
	@search nvarchar(50),
	@orderby int = 0
AS
BEGIN
	SET NOCOUNT ON;
	SELECT * 
	FROM (
		SELECT ROW_NUMBER() 
		OVER (ORDER BY
		CASE WHEN @orderby = 0 THEN w.datecreated END DESC,
		CASE WHEN @orderby = 1 THEN w.title END ASC) 
		AS rownum, w.*
		FROM WebSites AS w
		WHERE w.ownerId = CASE WHEN @userId > 0 THEN @userId ELSE w.ownerId END
		AND w.deleted=0
		AND w.enabled=1
		AND w.title LIKE CASE WHEN @search <> '' THEN '%' + @search + '%' ELSE w.title END
	) AS tbl
	WHERE rownum >= @start AND  rownum <= @start + @length
END
