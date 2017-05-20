-- =============================================
-- Author:		Mark Entingh
-- Create date: 7/24/2014 7:48 PM
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[Page_Publish]
	@pageId int = 0, 
	@websiteId int = 0
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @pagecreated datetime, @pagepublished datetime
	SELECT @pagecreated = datecreated, @pagepublished = datepublished FROM pages WHERE pageid=@pageId AND websiteid=@websiteId
	IF dateadd(minute, 1, @pagecreated) < @pagepublished BEGIN
		UPDATE pages SET datefirstpublished = GETDATE(), datepublished = GETDATE() WHERE pageid=@pageId AND websiteid=@websiteId
	END
	UPDATE pages SET datepublished = GETDATE() WHERE pageid=@pageId AND websiteid=@websiteId
END
