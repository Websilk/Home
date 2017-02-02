-- =============================================
-- Author:		Mark Entingh
-- Create date: 7/29/2015 7:20 PM
-- Description:	Get a list of components
-- =============================================
CREATE PROCEDURE [dbo].GetComponents 
	@start int = 1,
	@length int = 12,
	@category int = 0
AS
BEGIN
	SET NOCOUNT ON;
	SELECT * FROM (
		SELECT TOP (@start + @length) ROW_NUMBER() OVER(ORDER BY orderindex ASC) AS rownum, 
		componentId, [namespace], title, [description] 
		FROM components WHERE category=@category
	) AS tbl WHERE rownum >= @start AND rownum <= @start + @length
END

