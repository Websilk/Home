

-- =============================================
-- Author:		Mark Entingh
-- Create date: 5/21/2012 1:50 PM
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[GetUsersForAdmin] 
	@start int = 0, 
	@length int = 0,
	@orderby int = 1,
	@keywords nvarchar(50) = ''
AS
BEGIN
	SET NOCOUNT ON;

	SELECT * FROM (
		SELECT TOP (@start+@length) ROW_NUMBER() OVER (
			ORDER BY 
			u.deleted ASC,
			CASE WHEN @orderby = 1 THEN u.datecreated END DESC,
			CASE WHEN @orderby = 2 THEN u.datecreated END ASC,
			CASE WHEN @orderby = 3 THEN u.datecreated END ASC,
			CASE WHEN @orderby = 4 THEN u.lastlogin END DESC,
			CASE WHEN @orderby = 5 THEN u.lastlogin END DESC,
			CASE WHEN @orderby = 6 THEN u.lastlogin END DESC
		) AS rownum, u.* FROM Users u 
		WHERE 
		u.email = CASE WHEN @keywords <> '' THEN @keywords ELSE u.email END
		AND u.status = CASE WHEN @orderby = 3 THEN 0 ELSE u.status END
		AND u.lastlogin <= CASE WHEN @orderby = 4 THEN DATEADD(DAY, -30, GETDATE()) 
		ELSE CASE WHEN @orderby = 5 THEN DATEADD(DAY, -90, GETDATE()) ELSE u.lastlogin END END
		AND u.deleted = CASE WHEN @orderby = 6 THEN 1 ELSE u.deleted END
	) AS a 
	WHERE a.rownum >= @start AND a.rownum <= @start + @length 
	
END
