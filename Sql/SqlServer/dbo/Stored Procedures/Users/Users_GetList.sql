-- =============================================
-- Author:		Mark Entingh
-- Create date: ? 2008 ?
-- Description:	Get a list of users based on a search filter
-- =============================================
CREATE PROCEDURE [dbo].[Users_GetList]
	@userId int = 0, 
	@start int = 1,
	@length int = 10,
	@email nvarchar(75) = '',
	@displayname nvarchar(25) = '',
	@orderby int = 1
AS
BEGIN
	SET NOCOUNT ON;
	SELECT userId, email, displayname, photo, status, dateCreated
	FROM (SELECT ROW_NUMBER() 
	OVER (ORDER BY
	CASE WHEN @orderby = 0 THEN u.email END DESC,
	CASE WHEN @orderby = 1 THEN u.displayname END ASC 
	) as rownum, u.*
	FROM Users AS u
	WHERE 
	u.userId = CASE WHEN @userId > 0 THEN @userId ELSE u.userId END
	AND u.displayname LIKE CASE WHEN @displayname <> '' THEN '%' + @displayname + '%' ELSE u.displayname END
	AND u.email LIKE CASE WHEN @email <> '' THEN '%' + @email + '%' ELSE u.email END
	) as myTable
	WHERE rownum >= @start AND  rownum <= @start + @length
END
