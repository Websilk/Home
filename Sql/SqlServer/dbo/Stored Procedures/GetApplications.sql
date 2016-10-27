-- =============================================
-- Author:		Mark Entingh
-- Create date: 11/18/2009
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[GetApplications]
	@userId int = 0, 
	@websiteId int = 0,
	@keyword nvarchar(25) = '',
	@start int = 1,
	@length int = 10
AS
BEGIN
	SET NOCOUNT ON;
    SELECT applicationid INTO #tblowned FROM applicationsowned 
	WHERE websiteId=@websiteId

	SELECT * FROM(SELECT ROW_NUMBER() OVER (ORDER BY title ASC) AS rownum, 
	* FROM applications WHERE applicationid NOT IN (SELECT * FROM #tblowned)
	) AS tbl WHERE rownum >= @start AND rownum <= @start + @length
END
