-- =============================================
-- Author:		Mark Entingh
-- Create date: 9/7/2013 12:20 PM
-- Description:	insert or update website security
-- =============================================
CREATE PROCEDURE Security_Update 
	@websiteId int = 0, 
	@pageId int = 0,
	@userId int = 0,
	@feature nvarchar(50),
	@security binary(32)

AS
BEGIN
	SET NOCOUNT ON;
	IF (SELECT COUNT(*) FROM [Security]
	WHERE websiteId=@websiteId 
	AND pageId = CASE WHEN @pageId > 0 THEN @pageId ELSE pageId END
	AND userId=@userId AND feature=@feature) = 0
	BEGIN
		INSERT INTO [Security] (websiteId, pageId, userId, feature, security)
		VALUES(@websiteId, @pageId, @userId, @feature, @security)

	END
	ELSE
	BEGIN
		UPDATE [Security] SET security=@security WHERE websiteId=@websiteId 
		AND pageId = CASE WHEN @pageId > 0 THEN @pageId ELSE pageId END
		AND userId=@userId AND feature=@feature
	END


END
