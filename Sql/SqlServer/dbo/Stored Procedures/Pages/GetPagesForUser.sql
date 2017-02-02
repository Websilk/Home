-- =============================================
-- Author:		Mark Entingh
-- Create date: 8/3/2008
-- Description:	get a list of pages for a website
-- =============================================
CREATE PROCEDURE [dbo].[GetPagesForUser]
	@userId int = 0, 
	@start int = 0,
	@length int = 12,
	@search nvarchar(50) = '',
	@websiteId int = 0,
	@parentid int = 0,
	@orderby int = 0
AS
BEGIN
	SET NOCOUNT ON;
	SELECT datecreated, datemodified, [description], 
	ownerid, pageid, published, [security], title
	FROM (SELECT ROW_NUMBER() 
	OVER (ORDER BY
	CASE WHEN @orderby = 0 THEN p.datecreated END DESC,
	CASE WHEN @orderby = 1 THEN p.datemodified END DESC,
	CASE WHEN @orderby = 2 THEN p.title END ASC
) as rownum, p.*
	FROM Pages AS p
	WHERE 
	p.ownerid = CASE WHEN @userId <> '' THEN @userId ELSE p.ownerid END
	AND NOT p.deleted = 1
	AND p.enabled = 1
	AND (p.websiteid = CASE WHEN @websiteId > 0 THEN @websiteId ELSE 0 END)
	AND (
		p.title LIKE CASE WHEN @search <> '' THEN '%' + @search + '%' ELSE p.title END
		OR p.description LIKE CASE WHEN @search <> '' THEN '%' + @search + '%' ELSE p.description END
		)
	AND (p.parentid = CASE WHEN @parentid > 0 THEN @parentid ELSE p.parentid END)
	) as myTable
	WHERE rownum >= @start AND  rownum <= @start + @length
END
