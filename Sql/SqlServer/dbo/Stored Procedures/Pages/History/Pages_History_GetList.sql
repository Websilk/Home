CREATE PROCEDURE [dbo].[Pages_History_GetList]
	@websiteId int = 0,
	@datestart datetime = NULL,
	@length int = 100,
	@pageId int = 0
AS
IF @datestart IS NULL BEGIN SET @datestart = GETDATE() END
SELECT * FROM (
	SELECT ROW_NUMBER() OVER (ORDER BY h.datemodified DESC) AS rownum,
	p.*, h.datemodified AS historymodified, u.displayname, u.email
	FROM Pages_History h
	LEFT JOIN Pages p ON p.pageId=h.pageId
	LEFT JOIN Users u ON u.userId=h.userId
	WHERE h.websiteId=@websiteId
	AND h.datemodified <= @datestart
	AND h.pageId=CASE WHEN @pageId > 0 THEN @pageId ELSE h.pageId END
) AS tbl
WHERE rownum <= @length