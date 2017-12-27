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
		CASE WHEN @orderby = 0 THEN dateCreated END DESC,
		CASE WHEN @orderby = 1 THEN title END ASC) 
		AS rownum, *
		FROM Websites
		WHERE ownerId = CASE WHEN @userId > 0 THEN @userId ELSE ownerId END
		AND [enabled]=1
		AND title LIKE CASE WHEN @search <> '' THEN '%' + @search + '%' ELSE title END
	) AS tbl
	WHERE rownum >= @start AND  rownum <= @start + @length
END
