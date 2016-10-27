-- =============================================
-- Author:		Mark Entingh
-- Create date: 10/14/2011 1:21 PM
-- Description:	get a list of applications that a user owns
-- =============================================
CREATE PROCEDURE [dbo].[GetApplicationsOwned]
	@userId int = 0, 
	@websiteId int = 0,
	@keyword nvarchar(25) = '',
	@start int = 1,
	@length int = 10
AS
BEGIN
	SET NOCOUNT ON;
	SELECT applicationid INTO #tblowned FROM applicationsowned WHERE websiteId=@websiteId
	SELECT * FROM(SELECT ROW_NUMBER() OVER (ORDER BY title ASC) AS rownum, 
	* FROM applications WHERE applicationid IN (SELECT * FROM #tblowned)
	) AS tbl WHERE rownum >= @start AND rownum <= @start + @length
END
