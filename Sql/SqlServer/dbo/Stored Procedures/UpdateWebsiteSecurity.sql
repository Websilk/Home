-- =============================================
-- Author:		Mark Entingh
-- Create date: 9/7/2013 12:20 PM
-- Description:	insert or update website security
-- =============================================
CREATE PROCEDURE UpdateWebsiteSecurity 
	@websiteId int = 0, 
	@pageId int = 0,
	@userId int = 0,
	@feature nvarchar(25),
	@security nvarchar(200)

AS
BEGIN
	SET NOCOUNT ON;
	IF (SELECT COUNT(*) FROM WebsiteSecurity 
	WHERE websiteid=@websiteId 
	AND pageid = CASE WHEN @pageid > 0 THEN @pageid ELSE pageid END
	AND userid=@userid AND feature=@feature) = 0
	BEGIN
		INSERT INTO WebsiteSecurity (websiteid, pageid, userid, feature, security)
		VALUES(@websiteId, @pageId, @userId, @feature, @security)

	END
	ELSE
	BEGIN
		UPDATE WebsiteSecurity SET security=@security WHERE websiteid=@websiteId 
		AND pageid = CASE WHEN @pageid > 0 THEN @pageid ELSE pageid END
		AND userid=@userid AND feature=@feature
	END


END
