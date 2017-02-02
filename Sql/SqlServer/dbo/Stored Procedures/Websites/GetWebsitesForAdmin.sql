-- =============================================
-- Author:		Mark Entingh
-- Create date: 8/22/2009 10:55 PM
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[GetWebsitesForAdmin] 
	@start int = 1,
	@length int = 10,
	@search nvarchar(100)='',
	@orderby int = 1
AS
BEGIN
	SET NOCOUNT ON

	SELECT *, 
	(SELECT TOP 1 domain FROM websitedomains WHERE websiteid=tbl.websiteid) AS domain,
	(SELECT TOP 1 subdomain+'.'+domain FROM websitesubdomains WHERE websiteid=tbl.websiteid) AS subdomain
		 FROM (
		SELECT TOP (@start+@length) ROW_NUMBER() OVER(ORDER BY
			CASE WHEN @orderby = 1 THEN w.datecreated END DESC,
			CASE WHEN @orderby = 2 THEN w.datecreated END ASC,
			CASE WHEN @orderby = 3 THEN w.title END ASC,
			CASE WHEN @orderby = 4 THEN w.title END DESC,
			CASE WHEN @orderby = 5 THEN w.title END ASC,
			CASE WHEN @orderby = 6 THEN w.datecreated END DESC,
			CASE WHEN @orderby = 7 THEN w.datecreated END ASC,
			CASE WHEN @orderby = 8 THEN w.title END ASC,
			CASE WHEN @orderby = 9 THEN w.datecreated END DESC,
			CASE WHEN @orderby = 10 THEN w.datecreated END ASC,
			CASE WHEN @orderby = 11 THEN w.title END ASC,
			CASE WHEN @orderby = 12 THEN w.datecreated END DESC
		) AS rownum, 
		w.websiteid, w.title, w.pagehome, w.status, 
		w.deleted, p.datecreated, p.[security], p.published, p.ratingtotal, p.ratingcount, 
		p.datemodified, p.[description]
		
		FROM websites w, pages p 
		WHERE p.pageid=w.pagehome
		AND (
			w.title LIKE '%' + @search + '%'
			OR p.description LIKE '%' + @search + '%' 
		)

		AND w.deleted = CASE WHEN @orderby = 8 THEN 1 ELSE 
						CASE WHEN @orderby = 9 THEN 1 ELSE
						CASE WHEN @orderby = 10 THEN 1 ELSE w.deleted 
						END END END

		AND w.status = CASE WHEN @orderby = 11 THEN 0 ELSE
						CASE WHEN @orderby = 12 THEN 0 ELSE w.status
						END END


	)AS tbl WHERE rownum >= @start AND rownum <= @start + @length
	
END
