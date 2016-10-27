-- =============================================
-- Author:		Mark Entingh
-- Create date: 8/31/2008
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[GetPagesForWebsite] 
	@websiteId int = 0, 
	@ownerId int = 0,
	@search nvarchar(25) = '',
	@start int = 1,
	@length int = 9
AS
BEGIN
	SET NOCOUNT ON;
	SELECT pageid, ownerid, title, datecreated, datemodified, [security], published,
	[description], websiteid, websiteId
	 FROM (SELECT ROW_NUMBER() OVER(ORDER BY datecreated DESC) as rownum, 
	* FROM pages WHERE
	websiteId=@websiteId AND ownerId=@ownerId AND
	enabled=1 AND deleted=0 AND
	title LIKE CASE WHEN @search <> '' THEN '%' + @search + '%' ELSE title END
	) AS mytbl
	WHERE rownum BETWEEN @start AND @start + @length
	
END
